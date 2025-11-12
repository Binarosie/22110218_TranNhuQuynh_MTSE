import app from './app';

const PORT = process.env.PORT || 8088;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});