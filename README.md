# The Band of Misfits

The Jolly Band of AWS compatible services that AWS overlooked.

![the band of misfits](assets/the-band-of-misfits.jpg)

Amazon Web Services (AWS) is a vast collection of services that can be used to build almost anything. However, there are some patterns or functionalities that are common, can be implemented using services offered by AWS, but require some amount of work to deliver. This is where the "Band of Misfits" comes in. The "Band of Misfits" is a collection of services that provide common functionalities not available out-of-the-box in AWS. These services are designed to be simple to use and deploy, built on top of AWS services, and offer interfaces similar to AWS services.

Each project can be deployed to your AWS Account separately. It exposes a HTTP API and is invokable using a client similar to clients found in AWS SDK v3. Future versions will also include a Dashboard UI.

## The Colorful Gang:
* [*Jack in the Cloud*](misfits/jack-in-the-cloud/README.md) - like Jack in the Box popping up whenever you request: scheduled notifications' delivery.

## Project structure

Repository is built using [PDK](https://aws.github.io/aws-pdk/) and projects align to its structure.

All projects in the "Band of Misfits" (located in the `misfits/` directory) are structured in the same way. The structure is as follows:

```
<project>
├── README.md
├── api # API definitions
│   ├── generated # projects generated from the API definitions
│   │   ├── client # code generator for the API
│   │   ├── infrastructure # AWS infrastructure required to run the API
│   │   └── runtime # generated types for the API
│   ├── handlers # Lambda handlers for the API
│   └── model # Smithy models of the API
├── examples # examples of how to use the service
├── infra # AWS infrastructure required to run the service
└── service # service implementation
```

