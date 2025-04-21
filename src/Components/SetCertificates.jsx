import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";

export default function SetCertificates({ userDetails }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0); // -1 = left, 1 = right
  const [preview, setPreview] = useState(null);
  const ref = useRef(null);
  const id = useId();

  const certificatesData = userDetails?.certificates || {};
  const certificateArray = Object.entries(certificatesData).map(([key, value]) => ({
    id: key,
    ...value,
  }));

  const totalCertificates = certificateArray.length;

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused && totalCertificates > 1 && !preview) {
        handleNext();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused, totalCertificates, preview]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setPreview(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    if (preview) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [preview]);

  useOutsideClick(ref, () => {
    if (preview) setPreview(null);
  });

  if (totalCertificates === 0) return null;

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % totalCertificates);
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + totalCertificates) % totalCertificates);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      transition: { duration: 0.5 },
    }),
  };

  const current = certificateArray[activeIndex];

  return (
    <section className="w-full max-w-[500px] h-[400px] sm-max:h-[400px] ">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold">Achievements</h1>
      </div>

      {/* Main Carousel */}
      <div
        className="relative flex items-center justify-center w-full h-[300px] max-w-[500px] mx-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={current.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, info) => {
              if (info.offset.x < -100) handleNext();
              if (info.offset.x > 100) handlePrev();
            }}
            className="absolute w-full rounded-lg cursor-grab overflow-hidden"
            onClick={() => setPreview(current)}
          >
            <img
              src={current.certificateImage}
              alt={current.certificateName}
              loading="lazy"
              className="w-full sm:w-[450px] shadow-xl border p-2 aspect-video object-cover rounded-md mx-auto"
            />
          </motion.div>
        </AnimatePresence>

        {/* Prev & Next buttons */}
        <button
          onClick={() => {
            handlePrev();
            setIsPaused(true);
          }}
          className="absolute -left-5 sm-max:left-2 text-white bg-slate-700 p-3 rounded-full z-10"
        >
          ‹
        </button>

        <button
          onClick={() => {
            handleNext();
            setIsPaused(true);
          }}
          className="absolute -right-5 sm-max:right-2 text-white bg-slate-700 p-3 rounded-full z-10"
        >
          ›
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {certificateArray.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > activeIndex ? 1 : -1);
              setActiveIndex(index);
              setIsPaused(true);
            }}
            className={`h-3 w-3 rounded-full transition-all duration-300 ${
              index === activeIndex ? "bg-green-500 scale-110" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Modal Preview */}
      <AnimatePresence>
        {preview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 h-full w-full z-10"
            />
            <div className="fixed inset-0 grid place-items-center z-[100]">
              <motion.button
                key={`button-${preview.certificateName}-${id}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
                onClick={() => setPreview(null)}
              >
                <CloseIcon />
              </motion.button>

              <motion.div
                ref={ref}
                layoutId={`card-${preview.certificateName}-${id}`}
                className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
              >
                <motion.div layoutId={`image-${preview.certificateName}-${id}`}>
                  <img
                    src={preview.certificateImage}
                    alt={preview.certificateName}
                    loading="lazy"
                    className="w-full h-full lg:h-80 sm:rounded-t-md object-cover object-top"
                  />
                </motion.div>

                <div className="p-4 space-y-2">
                  <motion.h3
                    layoutId={`title-${preview.certificateName}-${id}`}
                    className="font-bold text-neutral-700 dark:text-neutral-200"
                  >
                    {preview.certificateName}
                    <span className="ml-3 text-gray-500 text-lg">
                      ({preview.certificateType})
                    </span>
                  </motion.h3>
                  <motion.p
                    layoutId={`description-${preview.certificateDescription}-${id}`}
                    className="text-neutral-600 dark:text-neutral-400"
                  >
                    {preview.certificateDescription}
                  </motion.p>

                  {preview.certificateUrl && (
                    <motion.a
                      layoutId={`button-${preview.certificateName}-${id}`}
                      href={preview.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 px-4 py-2 text-sm rounded-full font-bold bg-green-500 text-white"
                    >
                      View Certificate
                    </motion.a>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

export const CloseIcon = () => (
  <motion.svg
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.05 } }}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-black"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </motion.svg>
);
