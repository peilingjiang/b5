import React from 'react'

export const Emoji = props => {
  /*
  Takes two props:
  emoji="😊"
  label="smile"
  */
  return (
    <span
      className="emoji"
      role="img"
      aria-label={props.label ? props.label : ''}
      aria-hidden={props.label ? 'false' : 'true'}
    >
      {props.emoji}
    </span>
  )
}
