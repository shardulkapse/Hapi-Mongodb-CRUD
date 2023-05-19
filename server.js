"use strict";

const Hapi = require("@hapi/hapi");

const mongoConnectHandler = require("./mongodb");
const { ObjectId } = require("mongodb");

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
  });

  server.route({
    method: "GET",
    path: "/movies",
    handler: async (req, h) => {
      const client = await mongoConnectHandler();
      try {
        const offset = req.query.offset || 0;
        const movies = await client
          .db("sample_mflix")
          .collection("movies")
          .find({})
          .sort({ metacritic: -1 })
          .skip(offset)
          .limit(20)
          .toArray();
        return movies;
      } catch (err) {
        return err;
      } finally {
        await client.close();
      }
    },
  });
  server.route({
    method: "GET",
    path: "/movies/{id}",
    handler: async (req, h) => {
      const client = await mongoConnectHandler();
      try {
        const id = req.params.id;
        const movie = await client
          .db("sample_mflix")
          .collection("movies")
          .findOne({ _id: new ObjectId(id) });
        return movie || "Something went wrong";
      } catch (err) {
        return err;
      } finally {
        await client.close();
      }
    },
  });
  server.route({
    method: "POST",
    path: "/movies",
    handler: async (req, h) => {
      const client = await mongoConnectHandler();
      try {
        const payload = req.payload;
        const status = await client
          .db("sample_mflix")
          .collection("movies")
          .insertOne(payload);
        return status;
      } catch (err) {
        return err;
      } finally {
        await client.close();
      }
    },
  });
  server.route({
    method: "PUT",
    path: "/movies/{id}",
    handler: async (req, h) => {
      const client = await mongoConnectHandler();
      try {
        const id = req.params.id;
        const payload = req.payload;
        const status = await client
          .db("sample_mflix")
          .collection("movies")
          .updateOne({ _id: new ObjectId(id) }, { $set: payload });

        return status;
      } catch (err) {
        return err;
      } finally {
        await client.close();
      }
    },
  });

  //   Delete a movie
  server.route({
    method: "DELETE",
    path: "/movies/{id}",
    handler: async (req, h) => {
      const client = await mongoConnectHandler();
      try {
        const id = req.params.id;
        const status = await client
          .db("sample_mflix")
          .collection("movies")
          .deleteOne({ _id: new ObjectId(id) });
        return status;
      } catch (err) {
        return err;
      } finally {
        await client.close();
      }
    },
  });
  //   Search for a movie
  server.route({
    method: "GET",
    path: "/search",
    handler: async (req, h) => {
      const client = await mongoConnectHandler();
      try {
        const query = req.query.term;
        const results = await client
          .db("sample_mflix")
          .collection("movies")
          .aggregate([
            {
              $searchBeta: {
                search: {
                  query: query,
                  path: "title",
                },
              },
            },
            {
              $project: { title: 1, plot: 1 },
            },
            {
              $limit: 10,
            },
          ])
          .toArray();

        return results;
      } catch (err) {
        return err;
      } finally {
        await client.close();
      }
    },
  });

  await server.start();
  console.log("Server is running", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
