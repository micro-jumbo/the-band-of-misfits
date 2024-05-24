$version: "2"
namespace eu.micro_jumbo.the_band_of_misfits

use aws.auth#sigv4
use aws.protocols#restJson1
use smithy.framework#ValidationException

@sigv4(name: "execute-api")
@restJson1
service JackInTheCloud {
    version: "1.0"
    operations: [CreateTimer, CancelTimer, UpdateTimer]
    errors: [
      BadRequestError
      NotAuthorizedError
      InternalFailureError
    ]
}