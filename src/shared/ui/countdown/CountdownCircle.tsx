interface CountdownCircleProps {
    seconds: number
}
export const CountdownCircle = ({
    seconds,
}: CountdownCircleProps) => {
    const radius = 12
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = (seconds / 4) * circumference // от 0 до circumference

    return (
        <div className="relative flex h-6 w-6 items-center justify-center">
            <svg className="absolute h-6 w-6 rotate-[-90deg] transform">
                <circle
                    cx="12"
                    cy="12"
                    r={radius}
                    fill="transparent"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                />
            </svg>
            <span className="text-sm font-medium text-white">
                {seconds}
            </span>
        </div>
    )
}
