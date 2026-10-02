import { Typography } from 'antd'
import { useParams } from 'react-router'

function GamePage() {
  const { code } = useParams()

  return (
    <>
      <Typography.Title level={2}>Игра {code}</Typography.Title>
      <Typography.Paragraph>Здесь будет игровой стол (задача Ф6).</Typography.Paragraph>
    </>
  )
}

export default GamePage
