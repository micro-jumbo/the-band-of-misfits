# Smithy Model

This project defines the API operations and their inputs and outputs, using an interface definition language
called [Smithy](https://smithy.io/2.0/).

The default entrypoint for the API is `src/main/smithy/main.smithy`. You can add more Smithy files (and subfolders) in
the `src/main/smithy` directory, and these will be discovered as part of the project's build task.

Resources:

- [Smithy Documentation](https://smithy.io/2.0/)
- [Type Safe API Documentation](https://aws.github.io/aws-pdk/developer_guides/type-safe-api/index.html)

## Adding Operations

To add an operation, we can use the `operation` shape. It should be annotated with the `@http` trait, which defines the
method and path for the operation. Each operation has `input`, `output` and `errors`. You can define the `input`
and `output` inline using the `:=` syntax.

```smithy
/// This is an example operation.
@http(method: "POST", uri: "/foo/{myUrlParam}")
operation CreateFoo {
    input := {
        /// This parameter comes from the url
        @httpLabel
        myUrlParam: String

        /// Since there's no @httpLabel or @httpQuery annotation,
        /// this parameter will be in the POST request body
        @reqired
        someParameter: String

        /// This parameter is also in the body, but is optional
        anotherParameter: Double
    }
    output := {
        @required
        foo: Foo
    }
    errors: [ApiError]
}
```

In the above, we've referenced a shape called `Foo` in the output. Let's define that as a `structure`:

```smithy
structure Foo {
    /// Some documentation about this property
    @required
    myProperty: Integer
}
```

When we're happy with our new operation, we must add it to our `service`. By default, the `service` shape is in
the `src/main/smithy/main.smithy` file.

```smithy
@restJson1
service MyApi {
    version: "1.0"
    operations: [
        SayHello
        CreateFoo // <- add the new operation here
    ]
}
```

After adding the operation, please follow the remaining instructions in the [main README](../README.md).
