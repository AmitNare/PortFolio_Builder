import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "./ui/input";

const LocationSearch = ({ handleInputChange, errors, fieldsToShow, fieldPass  }) => {
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");

  const apiKey = "be38212551b642109b1767fb91f011be"; // Replace with your OpenCage API key
  const debounceTimeout = 1000; // 1 second debounce timeout

  // Fetch locations based on query
  const handleSearch = async (searchQuery) => {
    if (searchQuery.trim() === "") return;

    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json`,
        {
          params: {
            q: searchQuery,
            key: apiKey,
          },
        }
      );

      if (response.data.results.length > 0) {
        const filteredResults = response.data.results.map((result) => {
          const components = result.components;

          // Prepare the parts of the location based on `fieldsToShow`
          const locationParts = {
            suburb: components.suburb || components.village || components.town || "",
            city: components.city || components.town || components.village || "",
            state: components.state || "",
            country: components.country || "",
          };

          const formatted = fieldsToShow
          .map((field) => locationParts[field])
          .filter(Boolean)
          .join(", ");

          return { formatted };
        });
        setLocations(filteredResults);
      } else {
        setLocations([]);
      }
    } catch (err) {
      console.error("Failed to fetch locations", err);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce the API call
  useEffect(() => {
    if (query && query !== selectedLocation) {
      const debounceSearch = setTimeout(() => {
        handleSearch(query);
      }, debounceTimeout);

      return () => clearTimeout(debounceSearch);
    }
  }, [query, selectedLocation]);

  const handleChange = (e) => {
    setQuery(e.target.value);
    handleInputChange({ target: { name: fieldPass, value: e.target.value } }); // Update parent form state
  };

  const handleAddressClick = (address) => {
    setQuery(address); // Set input value to the selected address
    setLocations([]); // Clear the list
    setSelectedLocation(address); // Avoid triggering API for selected address

    handleInputChange({ target: { name: fieldPass, value: address } }); // Update parent state
  };

  return (
    <div className="relative bg-background text-foreground ">
      <Input
        type="text"
        name="address"
        value={query}
        onChange={handleChange}
        placeholder="Enter a location"
        className={`p-2 border h-10 rounded-md w-full  text-foreground `}
          // ${ errors.address ? "border-red-500" : "border-gray-300" }
          />

      {loading && <p>Loading...</p>}
      {errors.address && <p className="absolute text-red-500 text-sm ">{errors.address}</p>}

      {locations.length > 0 && (
        <div className="absolute bg-gray-500 w-full z-10 ">

        <ul className=" border-t ">
          {locations.map((location, index) => (
            <li
            key={index}
            className="border-b py-2 cursor-pointer "
              onClick={() => handleAddressClick(location.formatted)}
              >
              <p>{location.formatted}</p>
            </li>
          ))}
        </ul>
          </div>
      )}
    </div>
  );
};

export default LocationSearch;
