import { useEffect } from "react";

export const useEnterExit = () => {
  useEffect(() => {
    document.body.classList.add("custom-header-relative");
    return () => {
      document.body.classList.remove("custom-header-relative");
    };
  }, []);
};

export function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatDuration(duration) {
  const [hours, minutes, seconds] = duration.split(":");

  if (hours === "00") {
    return `${minutes}:${seconds}`;
  } else {
    return `${hours}:${minutes}:${seconds}`;
  }
}
