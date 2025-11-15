from loguru import logger


def configure_logging() -> None:
  logger.remove()
  logger.add(
      sink=lambda msg: print(msg, end=""),
      format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level} | {message}",
      level="INFO",
  )


configure_logging()

