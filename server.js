const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

const keys = require("./config/keys.config");
const authController = require("./controllers/authController");
require("./config/passport.config")(passport);

// Define the GraphQL schema
const schema = buildSchema(`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
  }

  type AuthData {
    token: String!
  }

  input RegisterInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    password2: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type RootQuery {
    get: User!
  }

  type Mutation {
    login(input: LoginInput): String!
    register(input: RegisterInput): String!
  }

  schema {
    query: RootQuery
    mutation: Mutation
  }
`);

const root = {
  register: async ({ input }) => {
    console.log(input);

    return await authController.register(
      input.firstName,
      input.lastName,
      input.email,
      input.password,
      input.password2
    );
  },
  login: async ({ input }) => {
    return await authController.login(input.email, input.password);
  },
};

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());

// DB Config
mongoose
  .connect(keys.mongoURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

// GraphQL endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server up and running on port ${port}!`));
