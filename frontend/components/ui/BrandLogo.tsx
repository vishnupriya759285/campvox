import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BrandLogoProps {
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
  inverse?: boolean;
}

export function BrandLogo({
  showTagline = false,
  size = 'md',
  href = '/',
  className = '',
  inverse = false,
}: BrandLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-sm font-bold',
    md: 'text-base font-extrabold',
    lg: 'text-xl font-black',
  };

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/brand/campvox-emblem.png"
        alt="CAMPVOX campus emblem"
        width={128}
        height={128}
        className={`${iconSizes[size]} object-contain shrink-0`}
        priority={size === 'lg'}
      />

      <div className="flex flex-col justify-center">
        <span className={`font-sans font-black tracking-[-0.03em] leading-none ${inverse ? 'text-white' : 'text-[#123650]'} ${textSizes[size]}`}>
          CAMP<span className="text-emerald-700">VOX</span>
        </span>
        {showTagline && (
          <span className={`text-[11px] font-semibold tracking-normal mt-1 ${inverse ? 'text-white/75' : 'text-[#526F89]'}`}>
            Making Everyday Campus Life Easier
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
