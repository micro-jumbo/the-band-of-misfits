$version: "2"
namespace eu.micro_jumbo.the_band_of_misfits

@input
structure CancelTimerInput {
    @required
    id: String
}

enum CancelTimerResult {
    CANCELLED
    NOT_FOUND
}

@output
structure CancelTimerOutput {
    @required
    result: CancelTimerResult
}

@http(method: "POST", uri: "/cancel-timer")
@handler(language: "typescript")
operation CancelTimer {
    input: CancelTimerInput
    output: CancelTimerOutput
    errors: [BadRequestError, InternalFailureError]
}
