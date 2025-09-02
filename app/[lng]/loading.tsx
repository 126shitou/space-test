// Next.js 应用级别的 loading 组件
// 当页面正在加载时显示紫色渐变圆形加载动画
export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="relative">
        {/* 紫色渐变圆形加载动画 */}
        <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
        <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-purple-400 border-r-purple-500 animate-spin"></div>
      </div>
    </div>
  );
}
