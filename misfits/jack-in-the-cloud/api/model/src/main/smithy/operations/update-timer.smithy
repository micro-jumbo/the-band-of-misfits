$version: "2"
namespace eu.micro_jumbo.the_band_of_misfits

structure UpdateTimerInputPayload {
    @required
    id: String
    @required
    fireAt: DateTime
    @required
    payload: String
    type: String
}

structure UpdateTimerInput {
    @httpPayload
    payload: UpdateTimerInputPayload
}

structure UpdateTimerOutput {
    @required
    id: String
}

@http(method: "POST", uri: "/update-timer")
@handler(language: "typescript")
operation UpdateTimer {
    input: UpdateTimerInput
    output: UpdateTimerOutput
    errors: [BadRequestError, InternalFailureError]
}
