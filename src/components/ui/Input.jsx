export const Input = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  ...props
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-3 glass rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-impostor-purple transition-all ${className}`}
      {...props}
    />
  )
}
