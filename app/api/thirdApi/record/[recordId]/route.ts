import { NextRequest, NextResponse } from "next/server";
import { customError, customLog, customSuccess } from "@/lib/utils/log";
import { createDb } from "@/lib/db";
import { tasks, records } from "@/lib/db/schema/generation";
import { eq } from "drizzle-orm";
import { Result } from "@/lib/utils/result";
import { GenerationStatus } from "@/types/generation";
import { ToolFactory } from "@/lib/factory";
import ConvertMedia from "@/service/media";

// 获取任务状态并返回/存储
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ recordId: string }> }
) {
  const db = createDb();

  try {
    const { recordId } = await params;

    // 打印完整的请求信息
    customLog("record/[recordId] 完整URL:", request.url);

    customLog("api > thirdApi > record > POST: 该次API的 recordId", recordId);
    // 联表查询task
    const taskRecords = await db
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

    const taskRecord = taskRecords[0];
    // 未找到对应的task
    if (!taskRecord) {
      customError("api > thirdApi > record > POST:", "未找到对应的任务记录");
      throw new Error("未找到对应的任务记录");
    }

    // 如果状态是成功或失败 直接返回
    if (
      [GenerationStatus.SUCCEED, GenerationStatus.FAILED].includes(
        taskRecord.status as GenerationStatus
      )
    ) {
      return NextResponse.json(Result.success(taskRecord));
    }

    // 获取工具实例
    const toolInstance = ToolFactory.getTool(taskRecord.tool);

    if (!toolInstance) {
      customError(
        "api > thirdApi > generate > POST: 不支持的工具",
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

    // 发起第三方API请求
    const response = await fetch(requestConfig.url, requestConfig.options);

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
      customLog("api > thirdApi > record > POST: 任务成功", "转化url中");

      try {
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
    return NextResponse.json(Result.success(processedData));
  } catch (error: any) {
    const errorMsg =
      error instanceof Error ? error.message : "服务器出现异常，请稍后重试";

    customError("api > thirdApi > record > POST: catch error ", errorMsg);
    return NextResponse.json(Result.fail(errorMsg), { status: 500 });
  }
}
