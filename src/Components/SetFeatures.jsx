import React, { useState } from "react";

export default function SetFeatures({ userDetails }) {
  const [active, setActive] = useState(null);

  const featureArray = Object.entries(userDetails.features).map(
    ([key, value]) => ({
      id: key,
      ...value,
    })
  );

  return (
    <section className="p-6 text-foreground">
      {/* Section Title */}
      <h2 className="text-3xl font-bold  text-center mb-6">Our Features</h2>

      {/* Modal for active feature */}
      {active && typeof active === "object" && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100]">
          <div className="bg-background rounded-lg shadow-xl max-w-[600px] w-full p-6">
            <button
              onClick={() => setActive(null)}
              className="absolute top-4 right-4 p-2 bg-gray-300 rounded-full hover:bg-gray-400"
            >
              X
            </button>
            <h3 className="text-2xl font-semibold ">{active.featureName}</h3>
            <p className="text-lg  mt-2">{active.featureDescription}</p>
          </div>
        </div>
      )}

      {/* Feature Cards Grid */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureArray.map((feature) => (
          <div
            key={feature.id}
            onClick={() => setActive(feature)}
            className="bg-background p-5 border rounded-lg shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105 duration-200"
          >
            <h3 className="text-xl font-semibold  mb-3">{feature.featureName}</h3>
            <p className="">{feature.featureDescription}</p>
          </div>
        ))}
      </ul>
    </section>
  );
}
