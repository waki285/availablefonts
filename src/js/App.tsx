import React, { memo, useCallback, useState } from "react";
import { Admax } from "./components/Admax";

interface FontData {
  family: string;
  fullName: string;
  postscriptName: string;
  style: string;
  blob: () => Promise<Blob>;
}

declare global {
  interface Window {
    // this is only available in Chrome 103+ or Edge 103+
    queryLocalFonts?: () => Promise<FontData[]>;
  }
}

export default function App() {
  const [fonts, setFonts] = useState<FontData[]>([]);
  const [ogFonts, setOgFonts] = useState<FontData[]>([]); // for searching fonts
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string>(
    "Hello! こんにちは！ 你好!",
  );
  const [actualText, setActualText] = useState<string>(
    "Hello! こんにちは！ 你好!",
  );
  const [searchingFont, setSearchingFont] = useState<string>("");

  const changePreviewText = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setActualText(previewText);
    },
    [previewText],
  );

  const filterFont = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const filteredFonts = ogFonts.filter(font =>
        font.family.toLowerCase().includes(searchingFont.toLowerCase()),
      );
      setFonts(filteredFonts);
    },
    [ogFonts, searchingFont],
  );

  const fetchFonts = useCallback(async () => {
    if (!window.queryLocalFonts) {
      setError("queryLocalFonts is not available in your browser.");
      setState("error");
      return;
    }
    try {
      setState("loading");
      const fonts = await window.queryLocalFonts();
      // Browser may return an empty array if user denies access to local fonts, shit
      if (fonts.length === 0) {
        setError("No fonts were found. or you denied access to local fonts.");
        setState("error");
        return;
      }
      setFonts(fonts);
      setOgFonts(fonts);
      setState("success");
    } catch (e) {
      // @ts-ignore
      const status = await navigator.permissions.query({ name: "local-fonts" });
      if (status.state === "denied") {
        setError("You denied access to local fonts.");
      } else {
        setError("An unknown error occurred.");
      }
      setState("error");
    }
  }, []);

  return (
    <main className="px-2">
      <div className="flex flex-col items-center mt-12 gap-8">
        <h1 className="text-6xl font-display text-center">My available fonts!</h1>
        <div className="text-center">
          <p>
            Displays a list of fonts that can be displayed on this browser. Can
            only use in Chrome 103+ or Edge 103+.
          </p>
        </div>
        <Admax id="f1cb01227ffcbb642a5edaf807727f58" type="switch" />
        <div>
          {(state === "idle" && (
            <button
              onClick={fetchFonts}
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Fetch fonts
            </button>
          )) ||
            (state === "loading" && <p>Loading...</p>) ||
            (state === "success" && (
              <div className="flex flex-col gap-4">
                <p>
                  Found {fonts.length} font
                  {fonts.length === 1 ? "" : "s"}.
                </p>
                <form
                  className="flex items-center gap-4"
                  onSubmit={changePreviewText}
                >
                  <input
                    type="text"
                    className="px-4 py-2 rounded-md flex-grow border border-gray-300"
                    value={previewText}
                    onChange={e => setPreviewText(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-full flex-shrink-0"
                  >
                    Apply
                  </button>
                </form>
                <form className="flex items-center gap-4" onSubmit={filterFont}>
                  <input
                    type="text"
                    className="px-4 py-2 rounded-md flex-grow border border-gray-300"
                    value={searchingFont}
                    onChange={e => setSearchingFont(e.target.value)}
                    placeholder="Search fonts"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-full flex-shrink-0"
                  >
                    Search
                  </button>
                </form>
                <Fonts fonts={fonts} actualText={actualText} />
              </div>
            )) ||
            (state === "error" && (
              <div className="flex flex-col items-center gap-4">
                <h2 className="text-5xl">Sorry!</h2>
                <p>{error}</p>
              </div>
            ))}
        </div>
        <p>
          Made with ❤️ by{" "}
          <a
            href="https://github.com/waki285"
            rel="noopener noreferer"
            className="link"
          >
            @waki285
          </a>
        </p>
        <p>
          Source code is available on{" "}
          <a
            href="https://github.com/waki285/availablefonts"
            rel="noopener noreferer"
            className="link"
          >
            GitHub
          </a>
        </p>
      </div>
    </main>
  );
}

const Fonts = memo(
  ({ fonts, actualText }: { fonts: FontData[]; actualText: string }) => {
    return (
      <ul className="flex flex-col gap-4">
        {fonts.map(font => (
          <li key={font.postscriptName} className="flex flex-col gap-2">
            <div className="flex items-end gap-2 font-sans">
              <p className="font-medium text-xl">{font.family}</p>
              <p>{font.style}</p>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-full flex-shrink-0"
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(font.family);
                }}
              >
                Copy family
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <div
                className={`text-4xl ${font.style.toLowerCase()}`}
                style={{ fontFamily: `"${font.family.replaceAll('"', "")}", Tofu` }}
              >
                {actualText}
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  },
);
