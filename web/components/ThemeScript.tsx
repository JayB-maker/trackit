export default function ThemeScript() {
  const script = `(()=>{try{const t=localStorage.getItem('trackit_theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
