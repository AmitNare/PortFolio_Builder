import React from "react";

export default function SetFeatures({ userDetails }) {
  const features = userDetails?.features || {};
  const featureArray = Object.entries(features).map(([key, value]) => ({
    id: key,
    ...value,
  }));

  const hasFeatures = featureArray.length > 0;

    // Don't render the section if no Features exist
    if (!hasFeatures) {
      return null;
    }

  return (
    <section className="p-6 text-foreground">
      {/* Section Title */}
      <h2 className="text-3xl font-bold text-center mb-6">Our Features</h2>

      {/* Feature Cards or Fallback */}
        <ul className="flex flex-wrap gap-5 w-full justify-evenly items-center">
          {featureArray.map((feature) => (
            <div
              key={feature.id}
              className="w-full sm:w-96 p-5 flex flex-col items-center justify-center border rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <h3 className="text-3xl font-semibold mb-3">
                {feature.featureName || "Untitled Feature"}
              </h3>
              <p className="h-32 custom-scrollbar overflow-auto text-center text-gray-600 dark:text-gray-300">
                {feature.featureDescription || "No description available."}
              </p>
            </div>
          ))}
        </ul>
    </section>
  );
}
