/*
 * Transition d'entrée rejouée à chaque navigation (le template est remonté).
 * Animation CSS (opacity + transform, composée par le GPU) plutôt que JS :
 * elle ne reste jamais bloquée à mi-course si le thread principal est
 * occupé, et elle est coupée par les règles lite / prefers-reduced-motion
 * de globals.css.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
