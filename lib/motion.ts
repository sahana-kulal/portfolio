// Motion tokens — mirrors DESIGN_SYSTEM.md §5
export const ease = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

export const dur = {
  fast: 0.15,
  base: 0.4,
  slow: 0.8,
  hero: 1.2,
};

export const stagger = {
  base: 0.06,
  letters: 0.03,
};
