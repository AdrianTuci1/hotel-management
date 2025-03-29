import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import "./Carousel.css"; // Custom styles

const images = [
  "/cam1.jpg",
  "/cam2.jpeg",
  "/cam3.avif",
];

function SwipeableCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideWidth, setSlideWidth] = useState("60vw");
  const [slideOffset, setSlideOffset] = useState("50px")
  const gap = 20; // Set gap between slides in pixels

  // Detect screen width & update dynamically
  useEffect(() => {
    const updateScreenSize = () => {
      setSlideWidth(window.innerWidth < 1024 ? "80vw" : "60vw");
      setSlideOffset(window.innerWidth < 1024 ? "20px" : "50px")
    };

    updateScreenSize(); // Set on mount
    window.addEventListener("resize", updateScreenSize);

    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    trackMouse: true,
  });

  return (
    <div className="carousel-container" {...handlers}>
      {/* Carousel Track */}
      <div
        className="carousel-track"
        style={{
          transform: `translateX(calc(-${currentIndex} * (${slideWidth} + ${gap}px) + ${slideOffset}))`, // Apply gap dynamically
        }}
      >
        {images.map((img, index) => (
          <div
            key={index}
            className="slide"
            style={{ width: slideWidth, marginRight: `${gap}px`, }} // Apply gap
          >
            <img src={img} alt={`Slide ${index}`} />
          </div>
        ))}
      </div>

      {/* Controls Positioned at Bottom-Right */}
      <div className="controls">
        <div className="controls-wrapper">
          <button className="nav-btn left" onClick={prevSlide}>{"‹"}</button>
          <button className="nav-btn right" onClick={nextSlide}>{"›"}</button>
        </div>
      </div>
    </div>
  );
}

export default SwipeableCarousel;