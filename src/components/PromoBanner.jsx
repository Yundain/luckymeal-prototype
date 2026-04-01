export default function PromoBanner() {
  return (
    <div className="relative mx-4 rounded-2xl overflow-hidden bg-gradient-to-r from-green-800 to-green-600">
      {/* 배경 장식 (전구 느낌) */}
      <div className="absolute top-0 left-0 right-0 h-8 flex justify-around items-center">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: i % 3 === 0 ? '#FDE047' : i % 3 === 1 ? '#FB923C' : '#A3E635',
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between p-4 pt-6">
        <div>
          <p className="text-white/90 text-sm">올해 크리스마스</p>
          <p className="text-yellow-300 text-xl font-bold mt-0.5">케이크 모아보기</p>
        </div>

        {/* 케이크 이미지들 */}
        <div className="flex -space-x-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white/20 rotate-[-5deg]">
            <img
              src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&h=100&fit=crop"
              alt="케이크"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white/20 rotate-[5deg]">
            <img
              src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=100&h=100&fit=crop"
              alt="케이크"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
