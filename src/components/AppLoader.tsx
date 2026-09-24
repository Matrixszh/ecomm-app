import LatticeLoader from './LatticeLoader';

type AppLoaderProps = {
  label?: string;
  className?: string;
};

export default function AppLoader({ label = 'Loading', className }: AppLoaderProps) {
  return (
    <LatticeLoader
      status="working"
      label={label}
      doneLabel="Done"
      errorLabel="Error"
      pattern="orbit"
      grid={4}
      shape="round"
      doneColor="#22c55e"
      errorColor="#ef4444"
      cellSize={6}
      gap={3}
      fontSize={14}
      step={100}
      idleOpacity={0.15}
      glow={false}
      glowColor="#ff0044"
      showTimer
      color="#f8b0c3"
      className={className}
    />
  );
}
