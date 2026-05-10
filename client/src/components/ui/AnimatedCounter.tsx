import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

interface Props {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
}

export function AnimatedCounter({ value, prefix = '', suffix = '', duration = 2, decimals = 0 }: Props) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <span ref={ref}>
      {inView ? (
        <CountUp
          start={0}
          end={value}
          duration={duration}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          useEasing={true}
          separator=","
        />
      ) : (
        `${prefix}0${suffix}`
      )}
    </span>
  );
}
