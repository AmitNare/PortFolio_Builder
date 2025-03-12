import React, { useState } from "react";

export default function SetFeatures({ userDetails }) {

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

      {/* Feature Cards Grid */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureArray.map((feature) => (
          <div
            key={feature.id}
            className="bg-background p-5 border rounded-lg shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 duration-200"
          >
            <h3 className="text-xl font-semibold  mb-3">{feature.featureName}</h3>
            <p className="">{feature.featureDescription}</p>
          </div>
        ))}
      </ul>
    </section>
  );
}
