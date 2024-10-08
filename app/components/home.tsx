"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Map from "./map";
import data from "../../public/data.json";
import i18n from "../../public/i18n.json";
import { useSearchParams } from "next/navigation";

type SupportedLanguage = keyof typeof i18n;

const Home = () => {
  const [mapData, setMapData] = useState<typeof data.geomarks | null>(null);
  const [geomarkNames, setGeomarkNames] = useState<string[]>([]);
  const [selectedGeomarks, setSelectedGeomarks] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");

  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    () => {
      const supportedLanguages = Object.keys(i18n) as SupportedLanguage[];
      return langParam &&
        supportedLanguages.includes(langParam as SupportedLanguage)
        ? (langParam as SupportedLanguage)
        : "en";
    },
  );

  useEffect(() => {
    const names = data.geomarks.map((geomark) => Object.keys(geomark)[0]);
    setGeomarkNames(names);
    setSelectedGeomarks(names);
    updateMapData(names);
  }, []);

  const updateMapData = (selectedNames: string[]) => {
    const filteredData = data.geomarks.filter((geomark) =>
      selectedNames.includes(Object.keys(geomark)[0]),
    );
    setMapData(filteredData);
  };

  const handleCheckboxChange = (name: string) => {
    setSelectedGeomarks((prev) => {
      const newSelected = prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name];
      updateMapData(newSelected);
      return newSelected;
    });
  };

  const t = (key: string): string => {
    return (
      (i18n[currentLanguage] &&
        ((
          i18n[currentLanguage] as {
            [key: string]: string | Record<string, string>;
          }
        )[key] as string)) ||
      key
    );
  };

  const tGeomark = (key: string): string => {
    return (
      (i18n[currentLanguage]?.geomarks &&
        (i18n[currentLanguage].geomarks as { [key: string]: string })[key]) ||
      key
    );
  };

  return (
    <div className="h-screen w-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="w-full h-full"
          style={{
            background: "url(/background.jpg)",
            backgroundSize: "120%",
            backgroundPosition: "10% 10%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="bg-gradient-to-t from-black to-transparent h-[300px] xl:h-[200px] absolute bottom-0 left-0 right-0"></div>
          <div className="bg-gradient-to-r from-black to-transparent w-[15%] absolute bottom-0 left-0 top-0"></div>
          <div className="bg-gradient-to-l from-black to-transparent w-[15%] absolute bottom-0 top-0 right-0"></div>
        </div>
      </div>

      {/* 标题和语言选择器 */}
      <div className="absolute top-10 left-8 right-4 flex gap-4 items-center z-10">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <div className="bg-black bg-opacity-30 border border-white rounded px-2">
          <select
            className="bg-black bg-opacity-0 text-white px-2 py-1"
            value={currentLanguage}
            onChange={(e) => {
              setCurrentLanguage(e.target.value as SupportedLanguage);
              // 更新URL，但不刷新页面
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.set("lang", e.target.value);
              window.history.pushState({}, "", newUrl);
            }}
          >
            {(Object.keys(i18n) as SupportedLanguage[]).map((lang) => (
              <option key={lang} value={lang}>
                {i18n[lang].languageName}
              </option>
            ))}
          </select>
        </div>
        <div className="bg-black bg-opacity-30 border border-white rounded px-2">
          <select
            className="bg-black bg-opacity-0 text-white px-2 py-1"
            defaultValue="Chapter 2"
            onChange={(e) => {
              if (e.target.value !== "Chapter 2") {
                window.open(
                  "https://blairwave50.gumroad.com/l/rdptj",
                  "_blank",
                );
              }
            }}
          >
            {[
              "Chapter 1",
              "Chapter 2",
              "Chapter 3.1",
              "Chapter 3.2",
              "Chapter 3.3",
              "Chapter 3.4",
              "Chapter 3.5",
              "Chapter 3.6",
              "Chapter 4.1",
              "Chapter 4.2",
              "Chapter 4.3",
              "Chapter 4.4",
              "Chapter 4.5",
              "Chapter 5",
              "Chapter 6",
            ].map((chapter) => (
              <option key={chapter} value={chapter}>
                {chapter}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="absolute top-[12vh] left-[45vw] transform -translate-x-1/2 w-[45vw] max-w-[1000px]">
        <div className="relative w-full pb-[90%]">
          <div className="absolute inset-0 bg-[#82735B] shadow-[inset_0_0_10px_rgba(0,0,0,0.5),0_0_10px_rgba(0,0,0,0.5)]">
            <Map data={mapData} />
          </div>
        </div>
      </div>

      {/* 左侧数据列表 */}
      <div className="absolute top-[12vh] left-4 w-[280px] bg-black bg-opacity-50 p-4 rounded max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{t("geomarkList")}</h2>
        <ul>
          {geomarkNames.map((name, index) => (
            <li key={index} className="flex items-center mb-2">
              <div className="relative inline-block w-5 h-5 mr-2">
                <input
                  type="checkbox"
                  id={`checkbox-${name}`}
                  checked={selectedGeomarks.includes(name)}
                  onChange={() => handleCheckboxChange(name)}
                  className="absolute opacity-0 w-0 h-0"
                />
                <label
                  htmlFor={`checkbox-${name}`}
                  className="absolute top-0 left-0 w-5 h-5 bg-white border border-gray-400 rounded cursor-pointer"
                >
                  <span
                    className={`absolute inset-0 ${selectedGeomarks.includes(name) ? "bg-black" : ""}`}
                  >
                    {selectedGeomarks.includes(name) && (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    )}
                  </span>
                </label>
              </div>
              <label
                htmlFor={`checkbox-${name}`}
                className="flex items-center cursor-pointer"
              >
                <Image
                  src={`/markers/${name}.png`}
                  alt={name}
                  width={24}
                  height={24}
                  className="mr-2"
                />
                <span>{tGeomark(name)}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
