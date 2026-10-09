const colors = [
  { name: 'white', label: 'Paper' },
  { name: 'lavender', label: 'Lilac' },
  { name: 'mint', label: 'Mint' },
  { name: 'peach', label: 'Peach' },
  { name: 'sky', label: 'Sky' },
  { name: 'rose', label: 'Rose' },
];

export default function ColorPicker({ value, onChange, label = 'Note colour' }) {
  return (
    <fieldset className="color-picker">
      <legend>{label}</legend>
      <div className="color-options">
        {colors.map((color) => (
          <button
            key={color.name}
            type="button"
            className={`color-swatch swatch-${color.name}${value === color.name ? ' is-selected' : ''}`}
            aria-label={`${color.label} colour`}
            aria-pressed={value === color.name}
            title={color.label}
            onClick={() => onChange(color.name)}
          />
        ))}
      </div>
    </fieldset>
  );
}
