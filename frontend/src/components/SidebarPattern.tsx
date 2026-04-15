import sidebarPattern from "@/assets/illustrations/sidebar-pattern.svg";

export function SidebarPattern() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        backgroundImage: `url(${sidebarPattern})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top",
      }}
    />
  );
}
