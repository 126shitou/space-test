"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import ImageUpload from "./ImageUpload";
import DoubleImageUpload from "./DoubleImageUpload";
import Prompt from "./Prompt";
import AspectRatio from "./AspectRatio";
import Slider from "./Slider";
import ToggleGroup from "./ToggleGroup";
import {
  ImageParameter,
  PromptParameter,
  Parameter,
  RatioParameter,
  SliderParameter,
  ToggleGroupParameter,
  DoubleImageParameter,
} from "@/types/paramaters";

interface ParameterRenderProps {
  config: Parameter[];
}

// 暴露给父组件的方法接口
export interface ParameterRenderRef {
  getParameterValues: () => Record<string, any>;
  validate: () => boolean;
}

const ParameterRender = forwardRef<ParameterRenderRef, ParameterRenderProps>(
  ({ config }, ref) => {
    // 初始化参数值
    const initParameterValues = () => {
      return config.reduce((acc, parameter) => {
        if (parameter.defaultValue) acc[parameter.id] = parameter.defaultValue;
        return acc;
      }, {} as Record<string, any>);
    };

    // 状态管理参数值
    const [parameterValues, setParameterValues] = useState<Record<string, any>>(
      () => initParameterValues()
    );

    // 校验错误状态
    const [validationErrors, setValidationErrors] = useState<
      Record<string, string>
    >({});

    // 参数校验函数
    const validateParameters = () => {
      const errors: Record<string, string> = {};

      config.forEach((parameter) => {
        if (parameter.required) {
          const value = parameterValues[parameter.id];

          // 检查不同类型的参数是否为空
          switch (parameter.type) {
            case "image":
              if (!value || !(value instanceof File)) {
                errors[parameter.id] = `${parameter.name}是必填项`;
              }
              break;

            case "doubleImage":
              // 检查双图片参数：需要是包含leftImage和rightImage的对象
              if (
                !value ||
                typeof value !== "object" ||
                !value.left ||
                !(value.left instanceof File) ||
                !value.right ||
                !(value.right instanceof File)
              ) {
                errors[parameter.id] = `${parameter.name}需要上传两张图片`;
              }
              break;

            case "prompt":
              if (parameter.minLength) {
                if (value.length < parameter.minLength) {
                  errors[
                    parameter.id
                  ] = `${parameter.name}最少需要 ${parameter.minLength} 个字符`;
                }
              }
              if (parameter.maxLength) {
                if (value.length > parameter.maxLength) {
                  errors[
                    parameter.id
                  ] = `${parameter.name}最多需要 ${parameter.maxLength} 个字符`;
                }
              }
              if (
                !value ||
                (typeof value === "string" && value.trim() === "")
              ) {
                errors[parameter.id] = `${parameter.name}是必填项`;
              }
              break;

            default:
              // 其他类型的参数校验
              if (value === undefined || value === null || value === "") {
                errors[parameter.id] = `${parameter.name}是必填项`;
              }
              break;
          }
        }
      });

      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    };

    // 处理参数值变化
    const handleParameterChange = (id: string, value: any) => {
      setParameterValues((prev) => {
        const newValues = {
          ...prev,
          [id]: value,
        };
        return newValues;
      });

      // 清除对应参数的校验错误
      if (validationErrors[id]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });
      }
    };

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      // 获取当前参数值
      getParameterValues: () => parameterValues,
      // 校验功能（返回校验结果）
      validate: () => {
        return validateParameters();
      },
    }));

    return (
      <>
        {/* 参数渲染 */}
        {config.map((parameter: Parameter) => {
          // 渲染不同类型的参数组件
          const renderComponent = () => {
            switch (parameter.type) {
              case "image":
                const imageParam = parameter as ImageParameter;
                return (
                  <>
                    <label className="leading-normal font-bold text-sm block mb-3 ">
                      {imageParam.name || "Image"}
                    </label>
                    <ImageUpload
                      maxSize={imageParam.maxSize}
                      accept={imageParam.acceptedTypes?.join(",")}
                      onChange={(file) =>
                        handleParameterChange(imageParam.id, file)
                      }
                      value={parameterValues[imageParam.id]}
                      name={imageParam.name}
                    />
                    {/* 显示错误信息 */}
                    {validationErrors[imageParam.id] && (
                      <div className="mt-1 text-red-500 text-xs">
                        {validationErrors[imageParam.id]}
                      </div>
                    )}
                  </>
                );
              case "prompt":
                const promptParam = parameter as PromptParameter;
                return (
                  <>
                    <label className="leading-normal font-bold text-sm block mb-3  ">
                      {promptParam.name || "Prompt"}
                    </label>
                    <Prompt
                      value={parameterValues[promptParam.id]}
                      onChange={(value) =>
                        handleParameterChange(promptParam.id, value)
                      }
                      maxLength={promptParam.maxLength}
                      placeholder={promptParam.placeholder}
                    />
                    {/* 显示错误信息 */}
                    {validationErrors[promptParam.id] && (
                      <div className="mt-1 text-red-500 text-xs">
                        {validationErrors[promptParam.id]}
                      </div>
                    )}
                  </>
                );
              case "ratio":
                const ratioParam = parameter as RatioParameter;
                return (
                  <>
                    <label className="leading-normal font-bold text-sm block mb-3">
                      {ratioParam.name || "Ratio"}
                    </label>
                    <AspectRatio
                      options={ratioParam.options}
                      onChange={(value) =>
                        handleParameterChange(ratioParam.id, value)
                      }
                      value={parameterValues[ratioParam.id]}
                    />
                    {/* 显示错误信息 */}
                    {validationErrors[ratioParam.id] && (
                      <div className="mt-1 text-red-500 text-xs">
                        {validationErrors[ratioParam.id]}
                      </div>
                    )}
                  </>
                );
              case "slider":
                const sliderParam = parameter as SliderParameter;
                return (
                  <>
                    <label className="leading-normal font-bold text-sm block mb-3">
                      {sliderParam.name || "Slider"}
                    </label>
                    <Slider
                      min={sliderParam.min}
                      max={sliderParam.max}
                      step={sliderParam.step}
                      onChange={(value) =>
                        handleParameterChange(sliderParam.id, value)
                      }
                      value={[parameterValues[sliderParam.id]]}
                    />
                    {/* 显示错误信息 */}
                    {validationErrors[sliderParam.id] && (
                      <div className="mt-1 text-red-500 text-xs">
                        {validationErrors[sliderParam.id]}
                      </div>
                    )}
                  </>
                );
              case "toggleGroup":
                const toggleGroupParam = parameter as ToggleGroupParameter;
                return (
                  <>
                    <label className="leading-normal font-bold text-sm block mb-3">
                      {toggleGroupParam.name || "Toggle Group"}
                    </label>
                    <ToggleGroup
                      options={toggleGroupParam.options}
                      onChange={(value) =>
                        handleParameterChange(toggleGroupParam.id, value)
                      }
                      value={parameterValues[toggleGroupParam.id]}
                    />
                    {/* 显示错误信息 */}
                    {validationErrors[toggleGroupParam.id] && (
                      <div className="mt-1 text-red-500 text-xs">
                        {validationErrors[toggleGroupParam.id]}
                      </div>
                    )}
                  </>
                );
              case "doubleImage":
                const doubleImageParam = parameter as DoubleImageParameter;
                return (
                  <>
                    <label className="leading-normal font-bold text-sm block mb-3">
                      {doubleImageParam.name || "Double Image"}
                    </label>
                    <DoubleImageUpload
                      maxSize={doubleImageParam.maxSize}
                      accept={doubleImageParam.acceptedTypes?.join(",")}
                      onChange={(files) =>
                        handleParameterChange(doubleImageParam.id, files)
                      }
                      value={parameterValues[doubleImageParam.id]}
                    />
                    {/* 显示错误信息 */}
                    {validationErrors[doubleImageParam.id] && (
                      <div className="mt-1 text-red-500 text-xs">
                        {validationErrors[doubleImageParam.id]}
                      </div>
                    )}
                  </>
                );
              default:
                return (
                  <div>未支持的参数类型: {(parameter as Parameter).type}</div>
                );
            }
          };

          return (
            <div className="w-full mb-4" key={parameter.id}>
              {renderComponent()}
            </div>
          );
        })}
      </>
    );
  }
);

// 设置显示名称用于调试
ParameterRender.displayName = "ParameterRender";

export default ParameterRender;
