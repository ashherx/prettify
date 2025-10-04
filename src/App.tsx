import React, { useState, useRef, useCallback, useEffect } from "react";
import { domToPng } from "modern-screenshot";
import {
  Download,
  Upload,
  Maximize,
  PanelTop,
  CornerUpRight,
  Cloud,
  Sun,
  SunDim,
  Twitter,
  X,
  Copy,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import ProductHuntBadge from "./ProductHuntBadge";

interface EditorState {
  screenshot: string | null;
  background: string;
  padding: number;
  borderRadius: number;
  shadow: number;
  shadowIntensity: number;
  containerWidth: number;
  containerHeight: number;
  activeTab: "macOS" | "Gradients" | "Wallpapers";
  blur: number;
}

const wallpapers: { name: string; background: string }[] = [
  {
    name: "Sierra",
    background:
      "url(https://images.unsplash.com/photo-1511300636408-a63a89df3482)",
  },
  {
    name: "Ocean Mist",
    background:
      "url(https://images.unsplash.com/photo-1505144808419-1957a94ca61e)",
  },
  {
    name: "Desert Dunes",
    background:
      "url(https://images.unsplash.com/photo-1547234935-80c7145ec969)",
  },
  {
    name: "Smooth Waves",
    background:
      "url(https://images.unsplash.com/photo-1505820013142-f86a3439c5b2)",
  },
  {
    name: "Cloudy Peaks",
    background:
      "url(https://images.unsplash.com/photo-1536244636800-a3f74db0f3cf)",
  },
  {
    name: "Misty Forest",
    background:
      "url(https://images.unsplash.com/photo-1542273917363-3b1817f69a2d)",
  },
  {
    name: "Pastel Sky",
    background:
      "url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6)",
  },
  {
    name: "Gentle Sunrise",
    background:
      "url(https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5)",
  },
  {
    name: "Lush Green",
    background:
      "url(https://images.unsplash.com/photo-1527254436800-a3f74db0f3cf)",
  },
];

const macOSPresets: { name: string; background: string }[] = [
  {
    name: "Big Sur 2",
    background:
      "url(https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/abstract/macos-big-sur-apple-layers-fluidic-colorful-wwdc-stock-3840x2160-1455.jpg)",
  },
  {
    name: "Monterey",
    background:
      "url(https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/abstract/macos-monterey-stock-black-dark-mode-layers-5k-3840x2160-5889.jpg)",
  },
  {
    name: "Monterey 2",
    background:
      "url(https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/abstract/macos-monterey-wwdc-21-stock-5k-3840x2160-5584.jpg)",
  },
  {
    name: "Sequoia Blue Orage",
    background:
      "url(https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/abstract/sequoia-blue-orange.jpg)",
  },
  {
    name: "Sequoia Blue",
    background:
      "url(https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/abstract/sequoia-blue.jpg)",
  },
  {
    name: "Sonama Clouds",
    background:
      "url(https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/abstract/sonoma-clouds.jpg)",
  },
  {
    name: "Sonama Evening",
    background:
      "url(https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/abstract/sonoma-evening.jpg)",
  },
  {
    name: "Sonama from above",
    background:
      "url(https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/abstract/sonoma-from-above.jpg)",
  },
  {
    name: "Sonama River",
    background:
      "url(https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/abstract/sonoma-river.jpg)",
  },
];

const gradientPresets: { name: string; background: string }[] = [
  {
    name: "Purple Blend",
    background: "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
  },
  {
    name: "Ocean Blue",
    background: "linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)",
  },
  {
    name: "Lavender Haze",
    background: "linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%)",
  },
  {
    name: "Peach Sunset",
    background: "linear-gradient(62deg, #FBAB7E 0%, #F7CE68 100%)",
  },
  {
    name: "Lime Light",
    background: "linear-gradient(45deg, #85FFBD 0%, #FFFB7D 100%)",
  },
  {
    name: "Pink Lemonade",
    background: "linear-gradient(45deg, #FBDA61 0%, #FF5ACD 100%)",
  },
  {
    name: "Ocean Blue",
    background: "linear-gradient(to right, #2E3192, #1BFFFF)",
  },
  {
    name: "Sanguine",
    background: "linear-gradient(to right, #D4145A, #FBB03B)",
  },
  {
    name: "Lusty Lavender",
    background: "linear-gradient(to right, #662D8C, #ED1E79)",
  },
  {
    name: "Emerald Water",
    background: "linear-gradient(to right, #348F50, #56B4D3)",
  },
  {
    name: "Lemon Twist",
    background: "linear-gradient(to right, #3CA55C, #B5AC49)",
  },
  {
    name: "Frozen Berry",
    background: "linear-gradient(to right, #5C258D, #4389A2)",
  },
];

const CONTAINER_FIXED_HEIGHT = 600;

const App: React.FC = () => {
  const [state, setState] = useState<EditorState>({
    screenshot: null,
    background: gradientPresets[0].background, // Change this line
    padding: 10,
    borderRadius: 8,
    shadow: 30,
    shadowIntensity: 0.3,
    containerWidth: 100,
    containerHeight: 100,
    activeTab: "Gradients",
    blur: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotRef = useRef<HTMLDivElement>(null);

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [showModal, setShowModal] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (showModal) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [showModal]);

  const adjustImageSettings = (imgWidth: number, imgHeight: number) => {
    const containerHeight = CONTAINER_FIXED_HEIGHT;
    const containerWidth = (containerHeight * imgWidth) / imgHeight;

    if (containerWidth > 600 || imgHeight > containerHeight) {
      // Image is larger than the container, set border radius to 50% of the slider max
      setState((prev) => ({
        ...prev,
        borderRadius: Math.min(25, prev.borderRadius), // 25 is 50% of the max slider value (50)
      }));
    }

    // Add this condition to set padding to 50% when image height is >= container height
    if (imgHeight >= containerHeight) {
      setState((prev) => ({
        ...prev,
        padding: 15, // 15 is 50% of the max padding slider value (30)
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          adjustImageSettings(img.width, img.height);
        };
        img.src = e.target?.result as string;
        setState((prev) => ({
          ...prev,
          screenshot: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler for drag over event
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Handler for drop event
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload({
        target: { files },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Handler for paste event
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (items) {
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              handleFileUpload({
                target: { files: [file] },
              } as React.ChangeEvent<HTMLInputElement>);
            }
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  const downloadImage = useCallback(() => {
    if (screenshotRef.current) {
      const node = screenshotRef.current;

      // Temporarily adjust styles for capture
      const originalStyles = {
        width: node.style.width,
        height: node.style.height,
        maxWidth: node.style.maxWidth,
        maxHeight: node.style.maxHeight,
        borderRadius: node.style.borderRadius,
        overflow: node.style.overflow,
      };

      node.style.width = `${node.offsetWidth}px`;
      node.style.height = `${node.offsetHeight}px`;
      node.style.maxWidth = "none";
      node.style.maxHeight = "none";
      node.style.borderRadius = "0"; // Remove border radius
      node.style.overflow = "visible"; // Ensure nothing is cut off

      // Use modern-screenshot's domToPng with improved options
      domToPng(node, {
        filter: (n) => {
          // Exclude problematic stylesheets
          if (
            (n as Element).tagName === "LINK" &&
            (n as Element).getAttribute("rel") === "stylesheet"
          ) {
            return false;
          }
          return true;
        },
        quality: 1, // Set to maximum quality
        scale: isMobile ? 1.6 : 2, // Increase scale for better resolution
        style: {
          transform: `scale(${isMobile ? 1.6 : 2})`, // Reset any transforms
          "transform-origin": "top left",
          "border-radius": "0", // Ensure no border radius
        },
        width: node.offsetWidth * (isMobile ? 1.6 : 2), // Double the width
        height: node.offsetHeight * (isMobile ? 1.6 : 2), // Double the height
      })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "edited_screenshot.png";
          link.href = dataUrl;
          link.click();
          setShowModal(true); // Show the modal after download
        })
        .catch((err) => {
          console.error("Error generating image:", err);
        })
        .finally(() => {
          // Restore original styles
          Object.assign(node.style, originalStyles);
        });
    }
  }, [state]);

  const copyImageToClipboard = useCallback(() => {
    if (screenshotRef.current) {
      const node = screenshotRef.current;

      // Temporarily adjust styles for capture (same as in downloadImage)
      const originalStyles = {
        width: node.style.width,
        height: node.style.height,
        maxWidth: node.style.maxWidth,
        maxHeight: node.style.maxHeight,
        borderRadius: node.style.borderRadius,
        overflow: node.style.overflow,
      };

      Object.assign(node.style, {
        width: `${node.offsetWidth}px`,
        height: `${node.offsetHeight}px`,
        maxWidth: "none",
        maxHeight: "none",
        borderRadius: "0",
        overflow: "visible",
      });

      domToPng(node, {
        filter: (n) => {
          if (
            (n as Element).tagName === "LINK" &&
            (n as Element).getAttribute("rel") === "stylesheet"
          ) {
            return false;
          }
          return true;
        },
        quality: 1,
        scale: isMobile ? 1.6 : 2,
        style: {
          transform: `scale(${isMobile ? 1.6 : 2})`,
          "transform-origin": "top left",
          "border-radius": "0",
        },
        width: node.offsetWidth * (isMobile ? 1.6 : 2),
        height: node.offsetHeight * (isMobile ? 1.6 : 2),
      })
        .then((dataUrl) => {
          // Convert data URL to Blob
          fetch(dataUrl)
            .then((res) => res.blob())
            .then((blob) => {
              // Create a new ClipboardItem
              const item = new ClipboardItem({ "image/png": blob });
              // Write the ClipboardItem to the clipboard
              navigator.clipboard.write([item]).then(
                () => {
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                },
                (err) => {
                  console.error("Failed to copy image: ", err);
                }
              );
            });
        })
        .catch((err) => {
          console.error("Error generating image:", err);
        })
        .finally(() => {
          // Restore original styles
          Object.assign(node.style, originalStyles);
        });
    }
  }, [state, isMobile]);

  const containerStyle = {
    width: `${state.containerWidth}%`,
    height: isMobile
      ? `${Math.max(300, Math.min(state.containerHeight * 5, 600))}px`
      : `${state.containerHeight}%`,
    maxWidth: isMobile ? "100%" : "1280px",
    maxHeight: isMobile ? "600px" : "720px",
    position: "relative" as const,
    overflow: "hidden",
  };

  const backgroundWrapperStyle = {
    position: "absolute" as const,
    top: "-10px",
    left: "-10px",
    right: "-10px",
    bottom: "-10px",
    overflow: "hidden",
  };

  const backgroundStyle = {
    position: "absolute" as const,
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: state.activeTab !== "Gradients" ? "#000" : "transparent",
    filter: `blur(${state.blur}px)`,
    transform: "scale(1.1)", // Slightly scale up the background to cover blur edges
  };

  const wallpaperStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  };

  const contentStyle = {
    position: "absolute" as const,
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    padding: `${state.padding}%`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: `18px !important`,
  };

  const imageContainerStyle = {
    position: "relative" as const,
    display: "inline-block",
    borderRadius: `${state.borderRadius}px`,
    overflow: "hidden",
    boxShadow: `0 ${state.shadow}px ${state.shadow * 2}px rgba(0,0,0,${
      state.shadowIntensity
    })`,
  };

  const imageStyle = {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain" as const,
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setImageSize({ width: img.width, height: img.height });
    adjustImageSettings(img.width, img.height);
  };

  const handleTabChange = (newTab: "macOS" | "Gradients" | "Wallpapers") => {
    setState((prev) => ({
      ...prev,
      activeTab: newTab,
      background:
        newTab === "macOS"
          ? macOSPresets[0].background
          : newTab === "Gradients"
          ? gradientPresets[0].background
          : wallpapers[0].background,
    }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-8 relative">
      <h1 className="text-center mb-8 sm:mb-12">
        <span className="pacifico-regular text-3xl sm:text-4xl font-bold text-gray-900">
          prettify
        </span>
      </h1>
      <div
        id="mainapp"
        className="bg-white w-full max-w-7xl relative"
      >
        <div className="flex flex-wrap gap-8">
          <div className="w-full lg:flex-1 flex flex-col items-center">
            <div
              ref={screenshotRef}
              className="relative overflow-hidden rounded-lg mb-6 w-full border border-gray-200"
              style={containerStyle}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div style={backgroundWrapperStyle}>
                <div style={backgroundStyle}>
                  {state.activeTab === "macOS" ||
                  state.activeTab === "Wallpapers" ? (
                    <img
                      src={state.background
                        .replace("url(", "")
                        .replace(")", "")}
                      alt="Wallpaper"
                      style={wallpaperStyle}
                    />
                  ) : (
                    <div
                      style={{
                        ...wallpaperStyle,
                        background: state.background,
                      }}
                    />
                  )}
                </div>
              </div>
              <div style={contentStyle}>
                {state.screenshot ? (
                  <div
                    className="relative flex items-center justify-center"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <div style={imageContainerStyle}>
                      <img
                        src={state.screenshot}
                        alt="Screenshot"
                        style={imageStyle}
                        onLoad={handleImageLoad}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full p-8">
                    <div className="border-2 border-dashed border-white/30 rounded-lg p-12 text-center hover:border-white/50 transition-colors bg-white/5 backdrop-blur-sm">
                      <Upload className="mx-auto mb-3 text-white/60" size={32} />
                      <p className="text-white/90 text-sm font-medium mb-1">Drop, upload, or paste your image</p>
                      <p className="text-white/50 text-xs">PNG, JPG, or GIF</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-900 hover:bg-black text-white font-medium py-2 px-4 rounded-md flex items-center text-sm transition-colors"
              >
                <Upload className="mr-1.5" size={16} />
                Upload
              </button>
              {state.screenshot && (
                <>
                  <button
                    onClick={downloadImage}
                    className="bg-gray-900 hover:bg-black text-white font-medium py-2 px-4 rounded-md flex items-center text-sm transition-colors"
                  >
                    <Download className="mr-1.5" size={16} />
                    Download
                  </button>
                  <button
                    onClick={copyImageToClipboard}
                    className="bg-gray-900 hover:bg-black text-white font-medium py-2 px-4 rounded-md flex items-center text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={copySuccess}
                  >
                    <div className="w-4 h-4 mr-1.5 relative">
                      <Copy
                        className={`absolute transition-opacity duration-200 ${
                          copySuccess ? "opacity-0" : "opacity-100"
                        }`}
                        size={16}
                      />
                      <Check
                        className={`absolute transition-opacity duration-200 ${
                          copySuccess ? "opacity-100" : "opacity-0"
                        }`}
                        size={16}
                      />
                    </div>
                    {copySuccess ? "Copied" : "Copy"}
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="w-full lg:w-64">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                Background
              </h3>
              <div className="flex gap-1 mb-4">
                <button
                  className={`flex-1 py-1.5 px-2 text-xs font-medium text-center rounded transition-colors ${
                    state.activeTab === "Gradients"
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => handleTabChange("Gradients")}
                >
                  Gradients
                </button>
                <button
                  className={`flex-1 py-1.5 px-2 text-xs font-medium text-center rounded transition-colors ${
                    state.activeTab === "macOS"
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => handleTabChange("macOS")}
                >
                  macOS
                </button>
                <button
                  className={`flex-1 py-1.5 px-2 text-xs font-medium text-center rounded transition-colors ${
                    state.activeTab === "Wallpapers"
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => handleTabChange("Wallpapers")}
                >
                  Wallpapers
                </button>
              </div>
              <div className="overflow-x-auto -mx-4 px-4 mb-6">
                <div
                  className="flex gap-2"
                  style={{
                    width: state.activeTab === "Gradients" ? "500px" : "600px",
                  }}
                >
                  {(state.activeTab === "macOS"
                    ? macOSPresets
                    : state.activeTab === "Gradients"
                    ? gradientPresets
                    : wallpapers
                  ).map((preset, index) => (
                    <button
                      key={index}
                      className="flex-shrink-0 w-12 h-12 rounded bg-cover bg-center border border-gray-200 hover:border-gray-400 transition-colors"
                      style={{ backgroundImage: preset.background }}
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          background: preset.background,
                        }))
                      }
                    ></button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                Adjust
              </h3>
              <div className="space-y-4">
                <div>
                                    <label className="flex items-center text-xs font-medium text-gray-600 mb-2">
                    <Maximize className="mr-1.5 text-gray-400" size={12} />
                    Width
                  </label>
                  <input
                    type="range"
                    min={isMobile ? "70" : "35"}
                    max="100"
                    value={state.containerWidth}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        containerWidth: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-gray-900"
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs font-medium text-gray-600 mb-2">
                    <Maximize className="mr-1.5 text-gray-400" size={12} />
                    Height
                  </label>
                  <input
                    type="range"
                    min={isMobile ? "60" : "35"}
                    max={isMobile ? "120" : "100"}
                    value={state.containerHeight}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        containerHeight: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-gray-900"
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs font-medium text-gray-600 mb-2">
                    <PanelTop className="mr-1.5 text-gray-400" size={12} />
                    Padding
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={state.padding}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        padding: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-gray-900"
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs font-medium text-gray-600 mb-2">
                    <CornerUpRight className="mr-1.5 text-gray-400" size={12} />
                    Radius
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={state.borderRadius}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        borderRadius: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-gray-900"
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs font-medium text-gray-600 mb-2">
                    <Cloud className="mr-1.5 text-gray-400" size={12} />
                    Shadow
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={state.shadow}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        shadow: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-gray-900"
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs font-medium text-gray-600 mb-2">
                    <Sun className="mr-1.5 text-gray-400" size={12} />
                    Intensity
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={state.shadowIntensity}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        shadowIntensity: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-gray-900"
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs font-medium text-gray-600 mb-2">
                    <SunDim className="mr-1.5 text-gray-400" size={12} />
                    Blur
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={state.blur}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        blur: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-sm shadow-xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
            <img
              src={
                "https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/shobhit.png"
              }
              alt="Logo"
              className="mb-4 mx-auto w-[80px] h-[96px]"
            />
            <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">
              Thank you!
            </h2>
            <p className="mb-6 text-gray-600 text-center text-sm">
              Hope you enjoyed using prettify
            </p>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() =>
                  window.open("https://x.com/nullbytes00", "_blank")
                }
                className="w-full bg-gray-900 hover:bg-black text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors text-sm"
              >
                <span className="mr-2">Follow on</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <button
                onClick={() =>
                  window.open("https://shipfa.st/?via=shobhit", "_blank")
                }
                className="w-full bg-gray-900 hover:bg-black text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors text-sm"
              >
                <span>⚡ Ship Your Startup Fast</span>
              </button>
              <a
                href="https://www.buymeacoffee.com/shobhit99"
                target="_blank"
                className="w-full mt-1"
              >
                <img
                  src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                  alt="Buy Me A Coffee"
                  className="h-9 w-full rounded-md"
                />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
