import { Typography } from 'antd'
import { useParams } from 'react-router'

function RoomPage() {
  const { code } = useParams()

  return (
    <>
      <Typography.Title level={2}>Комната {code}</Typography.Title>
      <Typography.Paragraph>Здесь будет зал ожидания (задача Ф3).</Typography.Paragraph>
    </>
  )
}

export default RoomPage
