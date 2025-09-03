"use server";

import { customError, customLog, customSuccess } from "@/lib/utils/log";
import { db } from "@/lib/db";
import { tasks, records } from "@/lib/db/schema/generation";
import { eq } from "drizzle-orm";
import { Result } from "@/lib/utils/result";
import { GenerationStatus } from "@/types/generation";
import { ToolFactory } from "@/lib/factory";
import ConvertMedia from "@/service/media";

/**
 * 数据库操作重试机制
 * @param operation - 要执行的数据库操作
 * @param maxRetries - 最大重试次数
 * @param delay - 重试间隔时间（毫秒）
 */
const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      customLog(
        `数据库操作重试 ${i + 1}/${maxRetries}`,
        error instanceof Error ? error.message : String(error)
      );

      if (i === maxRetries - 1) {
        throw error;
      }

      // 等待后重试
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error("重试机制异常");
};

/**
 * 获取任务状态的Server Action
 * @param recordId - 记录ID
 * @returns 返回任务状态结果
 */
export async function getRecordStatusAction(recordId: string) {
  try {
    customLog("service > record > getRecordStatusAction: recordId", recordId);

    customLog(
      "service > record > getRecordStatusAction: 该次API的 recordId",
      recordId
    );

    customLog(
      "service > record > getRecordStatusAction: 数据库开始查询",
      JSON.stringify(db)
    );

    console.log("Step 1: Testing basic tasks query");
    try {
      const tasksOnly = await executeWithRetry(() =>
        db.select().from(tasks).limit(1)
      );
      console.log("step1 success:", JSON.stringify(tasksOnly));
    } catch (error) {
      console.error("step1 error:", error);
      customError(
        "数据库查询失败 - tasks表",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
    // 步骤 2: 测试 records 查询
    console.log("Step 2: Testing records query");
    try {
      const recordsOnly = await executeWithRetry(() =>
        db.select().from(records).where(eq(records.id, recordId)).limit(1)
      );
      console.log("step2 success:", JSON.stringify(recordsOnly));
    } catch (error) {
      console.error("step2 error:", error);
      customError(
        "数据库查询失败 - records表",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }

    // 步骤 3: 测试 JOIN
    console.log("Step 3: Testing join");
    try {
      const joinTest = await db
        .select()
        .from(tasks)
        .innerJoin(records, eq(tasks.recordId, records.id))
        .limit(1);
      console.log("step3 success:", JSON.stringify(joinTest));
    } catch (error) {
      console.error("step3 error:", error);
      customError(
        "数据库查询失败 - JOIN操作",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }

    // 记录数据库查询开始时间
    const dbQueryStart = Date.now();

    const taskRecords = await executeWithRetry(() =>
      db
        .select({
          id: tasks.id,
          taskId: tasks.taskId,
          status: tasks.status,
          submitAt: tasks.submitAt,
          tool: records.tool,
          supabaseId: records.supabaseId,
          recordId: records.id,
        })
        .from(tasks)
        .innerJoin(records, eq(tasks.recordId, records.id))
        .where(eq(records.id, recordId))
        .limit(1)
    );

    const dbQueryEnd = Date.now();
    customLog(
      "service > record > getRecordStatusAction: 数据库查询结束",
      `${dbQueryEnd - dbQueryStart}ms`
    );
    customLog("数据库查询耗时", `${dbQueryEnd - dbQueryStart}ms`);

    customLog(
      "service > record > getRecordStatusAction: 该次API的 taskRecords",
      JSON.stringify(taskRecords)
    );

    // 未找到对应的task
    if (!taskRecords || taskRecords.length === 0) {
      customError(
        "service > record > getRecordStatusAction:",
        "未找到对应的任务记录"
      );
      throw new Error("未找到对应的任务记录");
    }
    const taskRecord = taskRecords[0];

    // 如果状态是成功或失败 直接返回
    if (
      [GenerationStatus.SUCCEED, GenerationStatus.FAILED].includes(
        taskRecord.status as GenerationStatus
      )
    ) {
      return Result.success(taskRecord);
    }
    customLog(
      "service > record > getRecordStatusAction: 状态",
      taskRecord.status
    );
    // 获取工具实例
    const toolInstance = ToolFactory.getTool(taskRecord.tool);

    if (!toolInstance) {
      customError(
        "service > record > getRecordStatusAction: 不支持的工具",
        `Tool: ${
          taskRecord.tool
        }, Supported: ${ToolFactory.getSupportedTools().join(", ")}`
      );
      throw new Error(`不支持的工具: ${taskRecord.tool}`);
    }
    customLog(
      "service > record > getRecordStatusAction: 工具实例",
      JSON.stringify(toolInstance)
    );
    // 构建三方API请求
    const requestConfig = toolInstance.buildTaskStatusRequest(
      taskRecord.taskId
    );
    customLog("第三方API请求", `URL: ${requestConfig.url}`);

    // 记录第三方API请求开始时间
    const apiRequestStart = Date.now();
    // 发起第三方API请求
    const response = await fetch(requestConfig.url, requestConfig.options);
    const apiRequestEnd = Date.now();
    customLog("第三方API请求耗时", `${apiRequestEnd - apiRequestStart}ms`);

    if (!response.ok)
      throw new Error(
        `第三方API请求失败: ${response.status} ${response.statusText}`
      );

    // 处理三方响应
    const resData = await response.json();
    customSuccess("三方API请求成功返回数据", JSON.stringify(resData));
    const processedData = await toolInstance.processTaskStatusResponse(
      resData,
      taskRecord.taskId
    );
    customSuccess("三方API返回数据处理成功", JSON.stringify(processedData));

    if (
      processedData?.status == GenerationStatus.SUCCEED &&
      processedData.urls.length > 0
    ) {
      customLog(
        "service > record > getRecordStatusAction: 任务成功",
        "转化url中"
      );

      try {
        // 记录媒体文件上传开始时间
        const mediaUploadStart = Date.now();
        // 使用ConvertMedia将所有URLs上传到Cloudflare R2
        const cloudflareUrls = await Promise.all(
          processedData.urls.map(async (url: string) => {
            try {
              const cloudflareUrl = await ConvertMedia(
                url,
                requestConfig.authHeader as Record<string, string> | undefined,
                {
                  path: "generator/record",
                  skipExisting: false,
                  supabaseId: taskRecord.supabaseId,
                  recordId: taskRecord.recordId,
                  taskId: taskRecord.id,
                }
              );
              customSuccess(
                "媒体文件上传Cloudflare R2成功",
                `原URL: ${url}, 新URL: ${cloudflareUrl}`
              );
              return cloudflareUrl;
            } catch (error) {
              customError(
                "媒体文件上传Cloudflare R2失败",
                `URL: ${url}, 错误: ${error}`
              );
              return null;
            }
          })
        );
        const mediaUploadEnd = Date.now();
        customLog("媒体文件上传耗时", `${mediaUploadEnd - mediaUploadStart}ms`);

        // 更新processedData中的URLs
        processedData.urls = cloudflareUrls.filter(
          (url) => url !== null
        ) as string[];

        customSuccess(
          "所有媒体文件处理完成",
          `共处理${cloudflareUrls.length}个文件`
        );
      } catch (error) {
        customError("批量上传媒体文件到Cloudflare R2失败", error as string);
      }
    }

    // 返回数据
    return Result.success(processedData);
  } catch (error: any) {
    const errorMsg =
      error instanceof Error ? error.message : "服务器出现异常，请稍后重试";

    customError(
      "service > record > getRecordStatusAction: catch error ",
      errorMsg
    );
    return Result.fail(errorMsg);
  }
}
