import { motion } from "framer-motion";

const Sphere3D = () => {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80" style={{ perspective: "800px" }}>
      <motion.div
        className="w-full h-full rounded-full relative"
        style={{
          background: "radial-gradient(circle at 35% 35%, hsl(330 70% 90%), hsl(270 55% 78%), hsl(270 40% 60%))",
          transformStyle: "preserve-3d",
        }}
        animate={{ rotateY: 360, rotateX: 10 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {/* Inner glow */}
        <div
          className="absolute inset-4 rounded-full"
          style={{
            background: "radial-gradient(circle at 30% 30%, hsla(0,0%,100%,0.5), transparent 60%)",
          }}
        />
        {/* Ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "transparent",
            border: "2px solid hsla(270, 55%, 78%, 0.3)",
            transform: "rotateX(70deg) scale(1.1)",
          }}
        />
      </motion.div>
      {/* Shadow */}
      <div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-6 rounded-full"
        style={{
          background: "radial-gradient(ellipse, hsla(270,55%,78%,0.2), transparent 70%)",
        }}
      />
    </div>
  );
};

export default Sphere3D;
