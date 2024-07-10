$version: "2"
namespace eu.micro_jumbo.the_band_of_misfits

structure CreateTimerInput {
    id: String
    @required
    fireAt: DateTime
    @required
    payload: String
    type: String
}

structure CreateTimerOutput {
    @required
    id: String
}

@http(method: "POST", uri: "/create-timer")
@handler(language: "typescript")
operation CreateTimer {
    input: CreateTimerInput
    output: CreateTimerOutput
    errors: [BadRequestError, InternalFailureError]
}
