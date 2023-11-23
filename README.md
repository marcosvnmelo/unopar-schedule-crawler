# Unopar Schedule Crawler

This is a crawler that logs into [Unopar](https://www.unopar.com.br/) student area and reads the activities schedule, saving it in an xlsx file. The application uses a sqlite database, managed with [Prisma](https://www.prisma.io/) ORM, to temporarily store the data. The libs used to scrap data are [crawlee](https://crawlee.dev/) with [playwright](https://playwright.dev/).

## Installation

Use the package manager [pnpm](https://pnpm.js.org/) to install the dependencies.

```bash
pnpm install
```

If using in Linux and the system doesn't have all the dependencies, use the command:

```bash
pnpm install-deps
```

## Usage

To start the database, use the command:

```bash
pnpm prisma migrate dev
```

To run the crawler, use the command:

```bash
pnpm build
pnpm start
```

## Development

To run the crawler in development mode, use the command:

```bash
pnpm dev
```

## Environment Variables

The following environment variables are required:

-   `USER_LOGIN`: The login username for the college site.
-   `USER_PASSWORD`: The login password for the college site.
-   `DATABASE_URL`: The URL of the sqlite database. (Same as .env.example)
-   `XLS_FILE_NAME`: The name of the xlsx file to save the schedule data.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
