import splunklib.client as client

def connect_to_splunk(username,password,host='http://Alis-MacBook-Pro.local',port='8000',owner='admin',app='search',sharing='user'):
    try:
        service = client.connect(username=username,password=password,host=host,port=port,owner=owner,app=app,sharing=sharing)
        if service:
            print("Splunk service created successfully")
            print("-----------------------------------")
    except Exception as e:
        print(e)
    return service

def main():
    try:
        splunk_service = connect_to_splunk(username='admin',password='admin123')
    except Exception as e:
        print(e)

if __name__ == "__main__":
    main()