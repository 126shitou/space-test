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
 * 获取任务状态的Server Action
 * @param recordId - 记录ID
 * @returns 返回任务状态结果
 */
export async function getRecordStatusAction(recordId: string) {
  try {
    customLog("service > record > getRecordStatusAction: recordId", recordId);

    // 添加超时控制的数据库查询
    const queryTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("数据库查询超时")), 15000);
    });

    customLog("service > record > getRecordStatusAction: 开始数据库查询");

    // 联表查询task
    const taskRecordsPromise = db
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
      .where(eq(tasks.recordId, recordId))
      .limit(1);

    const taskRecords = await Promise.race([taskRecordsPromise, queryTimeout]);

    customLog("service > record > getRecordStatusAction: 数据库查询完成");

    const taskRecord = taskRecords[0];
    // 未找到对应的task
    if (!taskRecord) {
      customError(
        "service > record > getRecordStatusAction:",
        "未找到对应的任务记录"
      );
      throw new Error("未找到对应的任务记录");
    }

    // 如果状态是成功或失败 直接返回
    if (
      [GenerationStatus.SUCCEED, GenerationStatus.FAILED].includes(
        taskRecord.status as GenerationStatus
      )
    ) {
      return Result.success(taskRecord);
    }

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

    // 构建三方API请求
    const requestConfig = toolInstance.buildTaskStatusRequest(
      taskRecord.taskId
    );
    customLog("第三方API请求", `URL: ${requestConfig.url}`);

    // 添加超时控制的第三方API请求
    const apiTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("第三方API请求超时")), 30000);
    });

    customLog("service > record > getRecordStatusAction: 开始第三方API请求");

    // 发起第三方API请求
    const responsePromise = fetch(requestConfig.url, requestConfig.options);
    const response = await Promise.race([responsePromise, apiTimeout]);

    customLog("service > record > getRecordStatusAction: 第三方API请求完成");

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
        // 添加超时控制的媒体文件上传
        const uploadTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("媒体文件上传超时")), 60000);
        });

        customLog(
          "service > record > getRecordStatusAction: 开始批量上传媒体文件"
        );

        // 使用ConvertMedia将所有URLs上传到Cloudflare R2
        const cloudflareUrlsPromise = Promise.all(
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

        const cloudflareUrls = await Promise.race([
          cloudflareUrlsPromise,
          uploadTimeout,
        ]);

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
