export const Grid = ({ index, turn, value }) => {
  return (
    <div className="box" onClick={() => turn(index)}>
      {value}
    </div>
  )
}
