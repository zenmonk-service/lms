import { useMediaQuery } from "usehooks-ts";

export function useScreenSize() {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const isTablet = useMediaQuery("(min-width: 640px) and (max-width: 1023px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return {
    isMobile,
    isTablet,
    isDesktop,
    screen: isMobile
      ? "mobile"
      : isTablet
      ? "tablet"
      : "desktop",
  };
}