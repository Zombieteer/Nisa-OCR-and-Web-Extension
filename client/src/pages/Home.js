import React from "react";
import HeroSvg from "../HeroSvg";

const Home = () => {
  return (
    <div className="container flex flex-col items-center h-full px-8 mx-auto md:flex-row">
      <div className="flex-1 py-32">
        <h2 className="text-4xl font-bold ">
          Encrypt and Verify your documents using cryptography techniques
        </h2>
        {/* // Google button */}
      </div>
      <div className="flex-1">
        <HeroSvg className="mx-auto h-72" />
      </div>
    </div>
  );
};

export default Home;
