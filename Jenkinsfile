@Library(['ai-apps-shared-pipeline', 'ei-offering-config']) _

sterlingPipeline {
    repoName = "ibm-envizi-emissions-api-excel-addin-internal"
    minikubeTestEnabled = false
    agentLabel = null
    nodeversion = '22'
    yarnLintCommand = { sh 'echo "ignoring lint"' }
    buildCommand = null
    detectSecretsEnabled = true
    dockerBuildEnabled = false
    repoValidationEnabled = false
    uploadArtifactEnabled = false
    semanticReleaseBuildFiles = true
    deploymentEnabled = false
    sonarQubeAdditionalProperties = {[
        "sonar.exclusions":"boms/**"
    ]}

    acceptableFailedStageList = null

}