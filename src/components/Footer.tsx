import NexPlayLogo from './NexPlayLogo';

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest w-full border-t border-glass-border flex flex-col items-center gap-4 py-8 px-4 mb-20 md:mb-0">
      <NexPlayLogo size="md" showSubtitle={true} />
      <div className="flex gap-6">
        <a className="text-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Términos</a>
        <a className="text-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Privacidad</a>
        <a className="text-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Reembolsos</a>
      </div>
      <div className="text-sm text-on-surface-variant text-center">
        © {new Date().getFullYear()} NexPlay. Todos los derechos reservados.
      </div>
    </footer>
  );
}
