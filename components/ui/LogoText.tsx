export default function LogoText({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="inline-flex items-baseline tracking-tight">
      <span className="text-[#f97316] text-[1.35em] leading-[0.8] relative top-[0.1em]">J</span>
      <span className={inverted ? "text-white" : "text-[#312e81] leading-none"}>huggee</span>
    </span>
  );
}