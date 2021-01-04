export const Emoji = ({ emoji, label }) => {
  /*
  Takes two props:
  emoji="😊"
  label="smile"
  */
  return (
    <span
      className="emoji"
      role="img"
      aria-label={label ? label : ''}
      aria-hidden={label ? 'false' : 'true'}
    >
      {emoji}
    </span>
  )
}
