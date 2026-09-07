import tdeaLogo from '../../assets/tdea-logo.svg';

export function Logo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="h-10 w-10 overflow-hidden" title="Tecnológico de Antioquia">
        <img src={tdeaLogo} alt="Tecnológico de Antioquia" className="h-10 w-auto max-w-none" />
      </div>
    );
  }

  return <img src={tdeaLogo} alt="Tecnológico de Antioquia" className="h-10 w-auto" />;
}
