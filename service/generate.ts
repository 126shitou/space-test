"use server";

import { z } from "zod";
import { customLog, customError } from "@/lib/utils/log";
import { Result } from "@/lib/utils/result";
import { ToolFactory } from "@/lib/factory";
import { createClient } from "@/lib/db/supabase/server";
import { db } from "@/lib/db";
import { records, tasks } from "@/lib/db/schema/generation";
import { users } from "@/lib/db/schema/user";
import { GenerationStatus } from "@/types/generation";
import { eq } from "drizzle-orm";

// 基础请求参数验证schema
const baseRequestSchema = z.object({
  tool: z.string().min(1, "模型ID不能为空"),
  parameters: z.record(z.any()), // 参数由具体生成器验证
});

/**
 * 生成任务的Server Action
 * @param formData - 包含tool和parameters的表单数据
 * @returns 返回生成结果
 */
export async function generateAction(formData: FormData) {
  let newRecord: any; // 声明变量以便在catch块中使用

  try {
    // 从FormData中提取数据
    const tool = formData.get("tool") as string;
    const parametersStr = formData.get("parameters") as string;

    let parameters;
    try {
      parameters = JSON.parse(parametersStr);
    } catch {
      throw new Error("参数格式错误");
    }

    const body = { tool, parameters };
    customLog("service > generate > generateAction body", JSON.stringify(body));

    // 验证用户登录状态
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isLogin = user !== null;
    let currentPoints = 0;

    // 基础参数校验
    const baseValidation = baseRequestSchema.safeParse(body);
    if (!baseValidation.success) {
      const errors = baseValidation.error.flatten().fieldErrors;
      const firstError = Object.values(errors).flat()[0];
      customError(
        "service > generate > generateAction: 基础参数校验",
        JSON.stringify(errors)
      );
      throw new Error(firstError || "基础参数校验");
    }

    // 获取Tool实例
    const { tool: validatedTool, parameters: validatedParams } =
      baseValidation.data;
    const toolInstance = ToolFactory.getTool(validatedTool);

    // 获取不到Tool实例 则抛出异常
    if (!toolInstance) {
      customError(
        "service > generate > generateAction: 不支持的工具",
        `Tool: ${validatedTool}, Supported: ${ToolFactory.getSupportedTools().join(
          ", "
        )}`
      );
      throw new Error(`不支持的工具: ${validatedTool}`);
    }

    // 参数校验
    const paramValidation = toolInstance
      .getValidationSchema()
      .safeParse(validatedParams);

    // 参数校验失败 则抛出异常
    if (!paramValidation.success) {
      const errors = paramValidation.error.flatten().fieldErrors;
      const firstError = Object.values(errors).flat()[0];
      customError(
        "service > generate > generateAction: 模型参数校验",
        JSON.stringify(errors)
      );
      throw new Error(firstError || "模型参数校验失败");
    }

    const validatedParameters = paramValidation.data;
    // 获取请求配置
    const requestConfig = toolInstance.buildTaskRequest(validatedParameters);
    customLog("第三方API请求配置", JSON.stringify(requestConfig));

    // 查询需要消耗的积分
    const pointsCount = toolInstance.calculatePoints(validatedParameters);

    // 如果积分消耗大于0且未登录 则不允许生成
    if (pointsCount > 0 && !isLogin) {
      throw new Error("未登录，请先登录");
    }

    // 创建record记录并获取创建的record
    const dbInsertStart = Date.now();
    const [nr] = await db
      .insert(records)
      .values({
        supabaseId: user?.id || "anonymous", // 用户ID，如果未登录则使用匿名
        type: toolInstance.getReturnType(), // 生成类型，
        tool: validatedTool, // 使用的工具
        parameters: validatedParameters, // 生成参数
        expectedCount: validatedParameters.num || 1, // 期望生成数量，默认为1
        pointsCount: pointsCount, // 积分消耗
      })
      .returning();
    const dbInsertEnd = Date.now();
    customLog("DB-Insert-Record耗时", `${dbInsertEnd - dbInsertStart}ms`);

    newRecord = nr;

    customLog("创建的record记录", JSON.stringify(nr));

    // 如果登录了 查询积分是否足够
    if (pointsCount > 0 && isLogin) {
      // 查询用户当前积分
      const dbSelectStart = Date.now();
      const userFromDb = await db
        .select({ points: users.points })
        .from(users)
        .where(eq(users.supabaseId, user!.id))
        .limit(1);
      const dbSelectEnd = Date.now();
      customLog("DB-Select-UserPoints耗时", `${dbSelectEnd - dbSelectStart}ms`);

      if (userFromDb.length === 0) {
        throw new Error("用户不存在");
      }

      currentPoints = userFromDb[0].points;

      // 检查积分是否足够
      if (currentPoints < pointsCount) {
        throw new Error(
          `积分不足，当前积分：${currentPoints}，需要积分：${pointsCount}`
        );
      }
    }

    console.log("requestConfig", JSON.stringify(requestConfig));

    // 向三方平台发送请求
    const apiRequestStart = Date.now();
    const response = await fetch(requestConfig.url, requestConfig.options);
    const apiRequestEnd = Date.now();
    customLog(
      "Third-Party-API-Request耗时",
      `${apiRequestEnd - apiRequestStart}ms`
    );

    if (!response.ok) {
      customError(
        "service > generate > generateAction: 第三方API请求失败",
        `API请求失败: ${response.status} ${response.statusText}`
      );

      // 更新record状态为失败
      const dbUpdateFailStart = Date.now();
      await db
        .update(records)
        .set({
          status: "fail",
          updatedAt: new Date(),
        })
        .where(eq(records.id, newRecord.id));
      const dbUpdateFailEnd = Date.now();
      customLog(
        "DB-Update-Record-Fail耗时",
        `${dbUpdateFailEnd - dbUpdateFailStart}ms`
      );

      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    // 处理返回的数据 统一为相同的格式 taskId
    const processedResult = await toolInstance.processTaskResponse(
      responseData
    );

    customLog(`处理后的结果：`, JSON.stringify(processedResult));

    if (isLogin && pointsCount > 0) {
      // 扣除积分
      const dbUpdatePointsStart = Date.now();
      await db
        .update(users)
        .set({
          points: currentPoints - pointsCount,
          updatedAt: new Date(),
        })
        .where(eq(users.supabaseId, user!.id));
      const dbUpdatePointsEnd = Date.now();
      customLog(
        "DB-Update-UserPoints耗时",
        `${dbUpdatePointsEnd - dbUpdatePointsStart}ms`
      );

      customLog(
        "积分扣除成功",
        `用户${user!.id}扣除${pointsCount}积分，剩余${
          currentPoints - pointsCount
        }积分`
      );
    }

    // 创建task记录
    const dbInsertTaskStart = Date.now();
    const [newTask] = await db
      .insert(tasks)
      .values({
        recordId: newRecord.id, // 关联的record ID
        taskId: processedResult.taskId, // 第三方API返回的任务ID
        status: GenerationStatus.WAITING, // 初始状态为等待
        submitAt: new Date(), // 提交时间
      })
      .returning();
    const dbInsertTaskEnd = Date.now();
    customLog("DB-Insert-Task耗时", `${dbInsertTaskEnd - dbInsertTaskStart}ms`);

    // 更新record状态为成功
    const dbUpdateSuccessStart = Date.now();
    await db
      .update(records)
      .set({
        // record的状态而不是task
        status: "success",
        updatedAt: new Date(),
      })
      .where(eq(records.id, newRecord.id));
    const dbUpdateSuccessEnd = Date.now();
    customLog(
      "DB-Update-Record-Success耗时",
      `${dbUpdateSuccessEnd - dbUpdateSuccessStart}ms`
    );

    customLog("创建的task记录", JSON.stringify(newTask));

    return Result.success(newRecord.id);
  } catch (error) {
    customError(
      "service > generate > generateAction catch error",
      JSON.stringify(error)
    );

    // 如果record已创建但发生错误，更新record状态为失败
    try {
      if (typeof newRecord !== "undefined") {
        const dbUpdateFailCatchStart = Date.now();
        await db
          .update(records)
          .set({
            status: "fail",
            updatedAt: new Date(),
          })
          .where(eq(records.id, newRecord.id));
        const dbUpdateFailCatchEnd = Date.now();
        customLog(
          "DB-Update-Record-Fail-Catch耗时",
          `${dbUpdateFailCatchEnd - dbUpdateFailCatchStart}ms`
        );
      }
    } catch (updateError) {
      customError(
        "service > generate > generateAction: 更新record状态失败",
        JSON.stringify(updateError)
      );
    }

    return Result.fail((error as Error).message || "API请求失败");
  }
}
