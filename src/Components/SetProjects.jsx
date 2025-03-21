import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";

export default function SetProjects({ userDetails }) {
  const [active, setActive] = useState(null);
  const ref = useRef(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  const projectArray = Object.entries(userDetails.projects).map(
    ([key, value]) => ({
      id: key,
      ...value,
    })
  );

  return (
    <section className="w-full flex-col justify-evenly items-center">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold ">
         Projects
        </h1>
      </div>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.projectName}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.projectName}-${id}`}
              ref={ref}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.projectName}-${id}`}>
                <img
                  priority
                  width={200}
                  height={200}
                  src={active.projectImage}
                  alt={active.projectName}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />
              </motion.div>

              <div>
                <div className="flex flex-col justify-between items-start p-4">
                  <div>
                    <motion.h3
                      layoutId={`title-${active.projectName}-${id}`}
                      className="font-bold text-neutral-700 dark:text-neutral-200"
                    >
                      {active.projectName}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.projectDescription}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {active.projectDescription}
                    </motion.p>
                  </div>

                  {active.projectUrl && (
                    <motion.a
                      layoutId={`button-${active.projectName}-${id}`}
                      href={active.projectUrl}
                      target="_blank"
                      className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white"
                    >
                      View Project
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="flex justify-center flex-wrap gap-10 sm-max:gap-4">
        {projectArray.map((project) => (
          <motion.div
            layoutId={`card-${project.projectName}-${id}`}
            key={project.id}
            onClick={() => setActive(project)}
            className="border rounded-lg shadow-lg p-2 cursor-pointer"
          >
            <motion.div layoutId={`image-${project.projectName}-${id}`}>
              <img
                src={project.projectImage}
                alt={project.projectName}
                loading="lazy"
                className="w-96 aspect-video object-cover rounded-md "
              />
            </motion.div>
          </motion.div>
        ))}
      </ul>
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
