export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
            <div className="max-w-lg mx-auto px-4 text-center">
                {/* 404 Title */}
                <div className="mb-8">
                    <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-gradient-to-r from-[#8a38fc] to-[#6d28d9] bg-clip-text leading-none">
                        404
                    </h1>
                </div>

                {/* Error Message */}
                <div className="mb-8 space-y-3">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#0d0d0d]">
                        Page Not Found
                    </h2>
                    <p className="text-[#3e4144] leading-relaxed">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                </div>


            </div>
        </div>
    );
}
