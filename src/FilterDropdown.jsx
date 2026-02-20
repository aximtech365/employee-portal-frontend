const FilterDropdown = ({ label, value, onChange, options, placeholder = 'All' }) => {
  return (
    <div className="flex flex-col">
      {label && <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.title || option.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterDropdown;
