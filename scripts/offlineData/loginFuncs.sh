#!/bin/bash
frontLogin(){
    if [[ -z "${apiUrl}" ]]; then
        echo "ERROR: need to define apiUrl variable before call function." >&2
        return 1
    fi
    local zsUser=$1
    if [[ -z "${zsUser}" ]]; then
        echo "user:" >&2
        read -r zsUser
    fi
    local zsPassword
    local jwtToken
    echo "password of ${zsUser}:" >&2
    read -rs zsPassword
    echo "" >&2
    jwtToken=$(curl -s "${apiUrl}/api/auth/local" -H 'Content-Type: application/json' --data-raw '{"identifier":"'${zsUser}'","password":"'${zsPassword}'"}' | jq -r '.json.jwt')
    if [[ -z "${jwtToken}" ]] || [[ "${jwtToken}" = "null" ]]; then
        echo "ERROR: login failed." >&2
        return 2
    fi
    echo "${jwtToken}"
}

adminLogin(){
    if [[ -z "${apiUrl}" ]]; then
        echo "ERROR: need to define apiUrl variable before call function." >&2
        return 1
    fi
    local adminEmail=$1
    if [[ -z "${adminEmail}" ]]; then
        echo "email:" >&2
        read -r adminEmail
    fi
    local adminPassword
    local jwtToken
    echo "password of ${adminEmail}:" >&2
    read -rs adminPassword
    echo "" >&2
    jwtToken=$(curl -s "${apiUrl}/admin/login" -H 'Content-Type: application/json' --data-raw '{"email":"'${adminEmail}'","password":"'${adminPassword}'"}' | jq -r '.data.token')
    if [[ -z "${jwtToken}" ]] || [[ "${jwtToken}" = "null" ]]; then
        echo "ERROR: login failed." >&2
        return 2
    fi
    echo "${jwtToken}"
}
